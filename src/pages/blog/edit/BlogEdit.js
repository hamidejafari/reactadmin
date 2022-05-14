import React, { useState, useEffect } from "react";
import { Button, CircularProgress, Grid } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import Select from "react-select";
import AddCircleTwoToneIcon from "@mui/icons-material/AddCircleTwoTone";
import DeleteForeverTwoToneIcon from "@mui/icons-material/DeleteForeverTwoTone";
import CheckCircleTwoToneIcon from "@mui/icons-material/CheckCircleTwoTone";

import axiosInstance from "../../../utiles/axiosInstance";
import DropzoneSingleImage from "../../../components/UI/DropzoneSingleImage/DropzoneSingleImage";
import useGetData from "../../../hooks/useGetData";
import capitalize_first_letter from "../../../utiles/capitalize_first_letter";
import description_header_capitalize from "../../../utiles/description_header_capitalize";

const headerType = [
  { label: "h2", value: "h2" },
  { label: "h3", value: "h3" },
  { label: "h4", value: "h4" },
  { label: "h5", value: "h5" },
  { label: "h6", value: "h6" },
];

const BlogEdit = () => {
  const [descInput, setDescInput] = useState(0);

  const [title, setTitle] = useState("");
  const [titleSmall, setTitleSmall] = useState("");
  const [descriptionHeaderType, setDescriptionHeaderType] = useState([]);

  const [slug, setSlug] = useState("");
  const [titleSeo, setTitleSeo] = useState("");
  const [h1, setH1] = useState("");
  const [description, setDescription] = useState([]);
  const [descriptionSeo, setDescriptionSeo] = useState("");
  const [image, setImage] = useState([]);
  const [imageSeo, setImageSeo] = useState([]);
  const [shortDescription, setShortDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});

  //Category
  const [fethcCategoryLoading, setFethcCategoryLoading] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  //Blog Category
  const [fethcBlogCategoryLoading, setFethcBlogCategoryLoading] =
    useState(null);
  const [blogCategoryOptions, setBlogCategoryOptions] = useState([]);
  const [selectedBlogCategory, setSelectedBlogCategory] = useState(null);

  const navigate = useNavigate();
  const { _id } = useParams();

  const { loading: fetchBlogLoading, data: blog, getData } = useGetData();

  useEffect(() => {
    getData("/admin/blogs/" + _id);
  }, [getData, _id]);

  useEffect(() => {
    if (!blog) {
      return;
    }
    setTitle(blog.title);
    setTitleSmall(blog.titleSmall);
    setTitleSeo(blog.titleSeo);

    const descript = blog.description.map((description, index) => {
      return { ...description, order: index + 1 };
    });

    setDescription(descript);
    setDescriptionSeo(blog.descriptionSeo);
    setSlug(blog.slug);
    setH1(blog.h1);
    setShortDescription(blog.shortDescription);

    setSelectedCategory({
      label: blog?.categoryId?.title,
      value: blog?.categoryId?._id,
    });

    setSelectedBlogCategory({
      label: blog?.blogCategoryId?.title,
      value: blog?.blogCategoryId?._id,
    });

    if (blog?.description?.length) {
      setDescInput(blog.description.length);

      const arr = [];

      for (const head of blog.description) {
        arr.push({ label: head.headerType, value: head.headerType });
      }
      setDescriptionHeaderType(arr);

      setTimeout(() => {
        blog.description.forEach((element, index) => {
          window.tinymce?.init({
            selector: "#myeditablediv_" + index,
            height: 300,
            menubar: false,
            plugins: "code autolink link ",
            toolbar: "undo redo | code | link | Bold",
          });
        });
      }, 100);
    }

    if (blog.image) {
      setImage([
        {
          preview: process.env.REACT_APP_BACKEND_API_URL + "/" + blog.image,
          name: blog.image,
        },
      ]);
    }
    if (blog.imageSeo) {
      setImageSeo([
        {
          preview: process.env.REACT_APP_BACKEND_API_URL + "/" + blog.imageSeo,
          name: blog.imageSeo,
        },
      ]);
    }
    setTimeout(() => {
      window.tinymce?.init({
        selector: "#shortDescription",
        height: 300,
        menubar: false,
        plugins: "code autolink link ",
        toolbar: "undo redo | code | link | bold",
      });
    }, 100);
  }, [blog]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/tinymce/tinymce.min.js";
    document.body.appendChild(script);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage({});
    try {
      const formDescriptions = [...description];
      formDescriptions.forEach((formDescription, index) => {
        formDescription.desc =
          window.tinymce?.get(`myeditablediv_${index}`) &&
          window.tinymce?.get(`myeditablediv_${index}`).getContent();
      });

      formDescriptions.sort((a, b) => {
        return a.order - b.order;
      });

      const formData = new FormData();
      formData.append("title", title);
      formData.append("titleSeo", titleSeo);
      formData.append("titleSmall", titleSmall);
      if (selectedCategory?.value) {
        formData.append("categoryId", selectedCategory?.value);
      }
      if (selectedBlogCategory?.value) {
        formData.append("blogCategoryId", selectedBlogCategory?.value);
      }
      formData.append(
        "shortDescription",
        window.tinymce?.get(`shortDescription`) &&
          window.tinymce?.get(`shortDescription`).getContent()
      );

      formData.append("description", JSON.stringify(formDescriptions));
      formData.append("descriptionSeo", descriptionSeo);
      formData.append("slug", slug);
      if (h1) {
        formData.append("h1", h1);
      }

      if (image[0] && image[0].type) {
        formData.append("image", image[0]);
      }
      image[0]?.alt && formData.append("imageAlt", image[0].alt);

      if (imageSeo[0] && imageSeo[0].type) {
        formData.append("imageSeo", imageSeo[0]);
      }

      imageSeo[0]?.alt && formData.append("imageSeoAlt", imageSeo[0].alt);

      await axiosInstance.put("/admin/blogs/" + _id, formData);
      setLoading(false);

      toast.success("Updated Successfully.");
      navigate("/blogs");
    } catch (error) {
      if (error.response?.data?.error) {
        setErrorMessage(error.response?.data?.error);
      }
      setLoading(false);
    }
  };

  const categories = async () => {
    setFethcCategoryLoading(true);
    const { data } = await axiosInstance.get("/admin/category-level-three");
    setFethcCategoryLoading(false);
    const opt = [];
    for (const e of data) {
      opt.push({
        label: e.title,
        value: e._id,
        slug: e.slug,
      });
    }
    setCategoryOptions(opt);
  };
  const blogCategories = async () => {
    setFethcBlogCategoryLoading(true);
    const { data } = await axiosInstance.get("/admin/blog-categories");
    setFethcBlogCategoryLoading(false);
    const opt = [];
    for (const e of data?.data) {
      opt.push({
        label: e.title,
        value: e._id,
        slug: e.slug,
      });
    }
    setBlogCategoryOptions(opt);
  };

  useEffect(() => {
    categories();
    blogCategories();
    const script = document.createElement("script");
    script.src = "/tinymce/tinymce.min.js";
    document.body.appendChild(script);
  }, []);

  const addDescHandler = () => {
    const newDescInput = descInput + 1;

    setDescInput(newDescInput);

    setDescription((descript) => {
      const newVal = [...descript];
      newVal.push({ order: newDescInput });
      return newVal;
    });

    setTimeout(() => {
      window.tinymce?.init({
        selector: "#myeditablediv_" + descInput,
        height: 300,
        menubar: false,
        plugins: "code autolink link ",
        toolbar: "undo redo | code | link | Bold",
      });
    }, 100);
  };

  return (
    <React.Fragment>
      <Grid container justifyContent="center">
        <Grid item xs={12}>
          <div className="card mb-12rem  ">
            {fetchBlogLoading ? (
              <div className="d-flex justify-content-center">
                <CircularProgress className="me-3" color="inherit" />
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <div>
                      <label className="form-label" htmlFor="title">
                        Title
                      </label>
                      <input
                        className={`form-input ${
                          Array.isArray(errorMessage?.title) ? "is-invalid" : ""
                        }`}
                        id="title"
                        value={title}
                        onChange={(e) =>
                          setTitle(capitalize_first_letter(e.target.value, " "))
                        }
                      />
                      <div className="text-danger">
                        {Array.isArray(errorMessage?.title) &&
                          errorMessage?.title.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <div>
                      <label className="form-label" htmlFor="titleSmall">
                        Title Small
                      </label>
                      <input
                        className={`form-input ${
                          Array.isArray(errorMessage?.titleSmall)
                            ? "is-invalid"
                            : ""
                        }`}
                        id="title"
                        value={titleSmall}
                        onChange={(e) =>
                          setTitleSmall(
                            capitalize_first_letter(e.target.value, " ")
                          )
                        }
                      />
                      <div className="text-danger">
                        {Array.isArray(errorMessage?.titleSmall) &&
                          errorMessage?.titleSmall.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <div style={{ zIndex: 2 }} className=" position-relative">
                      <label className="form-label" htmlFor="blogCategory">
                        Blog Category
                      </label>
                      <Select
                        id="blogCategory"
                        isLoading={fethcBlogCategoryLoading}
                        value={selectedBlogCategory}
                        onChange={(selectedBlogCategory) => {
                          setSelectedBlogCategory(selectedBlogCategory);
                        }}
                        options={blogCategoryOptions}
                        isClearable
                      />
                      <div className="text-danger">
                        {Array.isArray(errorMessage?.blogCategoryId) &&
                          errorMessage?.blogCategoryId.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <div style={{ zIndex: 2 }} className=" position-relative">
                      <label className="form-label" htmlFor="category">
                        Category
                      </label>
                      <Select
                        id="category"
                        isLoading={fethcCategoryLoading}
                        value={selectedCategory}
                        onChange={(selectedCategory) => {
                          setSelectedCategory(selectedCategory);
                        }}
                        options={categoryOptions}
                        isClearable
                      />
                      <div className="text-danger">
                        {Array.isArray(errorMessage?.categoryId) &&
                          errorMessage?.categoryId.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <div>
                      <label className="form-label" htmlFor="slug">
                        Slug (URL)
                      </label>
                      <input
                        className={`form-input ${
                          Array.isArray(errorMessage?.slug) ? "is-invalid" : ""
                        }`}
                        id="slug"
                        value={slug}
                        onChange={(e) => {
                          setSlug(e.target.value);
                        }}
                      />
                      <div className="text-danger">
                        {Array.isArray(errorMessage?.slug) &&
                          errorMessage?.slug.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <div>
                      <label className="form-label" htmlFor="description">
                        Description
                      </label>
                      <div className="p-2 bg-gray">
                        {new Array(descInput)
                          .fill(undefined)
                          .map((_, index) => (
                            <React.Fragment key={index}>
                              <hr />
                              {index === descInput - 1 && (
                                <Button
                                  onClick={() => {
                                    const newDescription = [...description];
                                    newDescription.splice(index, 1);
                                    setDescription(newDescription);

                                    const newDescriptionHeaderType = [
                                      ...descriptionHeaderType,
                                    ];
                                    newDescriptionHeaderType.splice(index, 1);
                                    setDescriptionHeaderType(
                                      newDescriptionHeaderType
                                    );

                                    setDescInput(descInput - 1);

                                    window.tinymce.EditorManager.execCommand(
                                      "mceRemoveEditor",
                                      true,
                                      `myeditablediv_${descInput - 1}`
                                    );
                                  }}
                                  variant="contained"
                                  color="error"
                                >
                                  <DeleteForeverTwoToneIcon
                                    style={{ marginRight: "5px" }}
                                  />
                                  Remove
                                </Button>
                              )}
                              <div className=" my-3  ">
                                <label className="form-label">order</label>
                                <input
                                  key={index}
                                  className={`form-input`}
                                  value={description[index]?.order}
                                  onChange={(e) => {
                                    const obj = {
                                      order: +e.target.value,
                                    };
                                    description[index] = {
                                      ...description[index],
                                      ...obj,
                                    };
                                    setDescription([...description]);
                                  }}
                                />
                              </div>
                              <div className=" my-3  ">
                                <label className="form-label">Header</label>
                                <input
                                  key={index}
                                  className={`form-input`}
                                  value={description[index]?.header || ""}
                                  onChange={(e) => {
                                    const obj = {
                                      header: description_header_capitalize(
                                        e.target.value
                                      ),
                                    };
                                    description[index] = {
                                      ...description[index],
                                      ...obj,
                                    };
                                    setDescription([...description]);
                                  }}
                                />
                                <div className="text-danger">
                                  {Array.isArray(errorMessage?.description) &&
                                    Array.isArray(
                                      errorMessage?.description[0]
                                    ) &&
                                    errorMessage?.description[0][index] &&
                                    typeof errorMessage?.description[0][
                                      index
                                    ] === "object" &&
                                    errorMessage?.description[0][index].header}
                                </div>
                              </div>
                              <div
                                style={{ zIndex: 2, position: "relative" }}
                                className=" my-3  "
                              >
                                <label className="form-label">
                                  Header Type
                                </label>
                                <Select
                                  onChange={(selected) => {
                                    const newDescriptionHeaderType = [
                                      ...descriptionHeaderType,
                                    ];
                                    newDescriptionHeaderType[index] = selected;
                                    setDescriptionHeaderType(
                                      newDescriptionHeaderType
                                    );
                                    const obj = {
                                      headerType: selected.value,
                                    };
                                    description[index] = {
                                      ...description[index],
                                      ...obj,
                                    };
                                    setDescription([...description]);
                                  }}
                                  options={headerType}
                                  value={descriptionHeaderType[index]}
                                />
                                <div className="text-danger">
                                  {Array.isArray(errorMessage?.description) &&
                                    Array.isArray(
                                      errorMessage?.description[0]
                                    ) &&
                                    errorMessage?.description[0][index] &&
                                    typeof errorMessage?.description[0][
                                      index
                                    ] === "object" &&
                                    errorMessage?.description[0][index]
                                      .headerType}
                                </div>
                              </div>
                              <div className=" my-3  ">
                                <label className="form-label">
                                  Description
                                </label>
                                <textarea
                                  defaultValue={description[index]?.desc}
                                  rows="4"
                                  className={`form-input`}
                                  id={`myeditablediv_${index}`}
                                />
                                <div className="text-danger">
                                  {Array.isArray(errorMessage?.description) &&
                                    Array.isArray(
                                      errorMessage?.description[0]
                                    ) &&
                                    errorMessage?.description[0][index] &&
                                    typeof errorMessage?.description[0][
                                      index
                                    ] === "object" &&
                                    errorMessage?.description[0][index].desc}
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        <Button
                          onClick={addDescHandler}
                          variant="contained"
                          className={"w-100 border-raduis-0"}
                        >
                          <AddCircleTwoToneIcon
                            style={{ marginRight: "5px" }}
                          />
                          Add
                        </Button>
                        <div className="text-danger">
                          {Array.isArray(errorMessage?.description) &&
                            errorMessage?.description[0] &&
                            typeof errorMessage?.description[0] !== "object" &&
                            errorMessage?.description}
                        </div>
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} md={12}>
                    <div>
                      <label className="form-label" htmlFor="descriptionSeo">
                        H1 Tag Content
                      </label>
                      <input
                        className={`form-input ${
                          Array.isArray(errorMessage?.h1) ? "is-invalid" : ""
                        }`}
                        id="h1"
                        value={h1}
                        onChange={(e) =>
                          setH1(capitalize_first_letter(e?.target?.value, " "))
                        }
                      />
                      <div className="text-danger">
                        {Array.isArray(errorMessage?.h1) &&
                          errorMessage?.h1.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12}>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="shortDescription">
                        Short Description
                      </label>
                      <textarea
                        className={`form-input ${
                          Array.isArray(errorMessage?.shortDescription)
                            ? "is-invalid"
                            : ""
                        }`}
                        id="shortDescription"
                        defaultValue={shortDescription}
                      />
                      <div className="text-danger">
                        {Array.isArray(errorMessage?.shortDescription) &&
                          errorMessage?.shortDescription.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} md={12}>
                    <div>
                      <label className="form-label" htmlFor="image">
                        Image
                      </label>
                      <DropzoneSingleImage files={image} setFiles={setImage} />
                      <div className="text-danger">
                        {Array.isArray(errorMessage?.image) &&
                          errorMessage?.image.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <div>
                      <label className="form-label" htmlFor="titleSeo">
                        Title Seo
                      </label>
                      <input
                        className={`form-input ${
                          Array.isArray(errorMessage?.titleSeo)
                            ? "is-invalid"
                            : ""
                        }`}
                        id="titleSeo"
                        value={titleSeo}
                        onChange={(e) =>
                          setTitleSeo(
                            capitalize_first_letter(e?.target?.value, " ")
                          )
                        }
                      />
                      <div className="text-danger">
                        {Array.isArray(errorMessage?.titleSeo) &&
                          errorMessage?.titleSeo.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                      </div>
                    </div>
                  </Grid>

                  <Grid item xs={12} md={12}>
                    <div>
                      <label className="form-label" htmlFor="descriptionSeo">
                        Meta Description
                      </label>
                      <textarea
                        className={`form-input ${
                          Array.isArray(errorMessage?.descriptionSeo)
                            ? "is-invalid"
                            : ""
                        }`}
                        id="descriptionSeo"
                        value={descriptionSeo}
                        onChange={(e) => setDescriptionSeo(e?.target?.value)}
                        onBlur={(e) =>
                          setDescriptionSeo(
                            capitalize_first_letter(e?.target?.value, ". ")
                          )
                        }
                      />
                      <div className="text-danger">
                        {Array.isArray(errorMessage?.descriptionSeo) &&
                          errorMessage?.descriptionSeo.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <div>
                      <label className="form-label" htmlFor="imageSeo">
                        Image Seo
                      </label>
                      <DropzoneSingleImage
                        files={imageSeo}
                        setFiles={setImageSeo}
                      />
                      <div className="text-danger">
                        {Array.isArray(errorMessage?.imageSeo) &&
                          errorMessage?.imageSeo.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                    >
                      <CheckCircleTwoToneIcon style={{ marginRight: "5px" }} />
                      Submit
                    </Button>
                    {loading ? (
                      <CircularProgress className="me-3" color="inherit" />
                    ) : null}
                  </Grid>
                </Grid>
              </form>
            )}
          </div>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default BlogEdit;
