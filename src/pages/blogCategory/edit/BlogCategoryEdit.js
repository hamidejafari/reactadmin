import React, { useState, useEffect } from "react";
import { Button, CircularProgress, Grid } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import Select from "react-select";
import CheckCircleTwoToneIcon from "@mui/icons-material/CheckCircleTwoTone";
import axiosInstance from "../../../utiles/axiosInstance";
import DropzoneSingleImage from "../../../components/UI/DropzoneSingleImage/DropzoneSingleImage";
import capitalize_first_letter from "../../../utiles/capitalize_first_letter";
import useGetData from "../../../hooks/useGetData";

const BlogCategoryEdit = () => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [titleSeo, setTitleSeo] = useState("");
  const [h1, setH1] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionSeo, setDescriptionSeo] = useState("");
  const [image, setImage] = useState([]);
  const [imageSeo, setImageSeo] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fethcCategoryLoading, setFethcCategoryLoading] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});

  const { _id } = useParams();

  const {
    loading: fetchBlogCategoryloading,
    data: blogCategory,
    getData,
  } = useGetData();

  useEffect(() => {
    getData("/admin/blog-categories/" + _id);
  }, [getData, _id]);

  useEffect(() => {
    if (!blogCategory) {
      return;
    }

    setTitle(blogCategory.title);
    setTitleSeo(blogCategory.titleSeo);
    setDescription(blogCategory.description);
    setDescriptionSeo(blogCategory.descriptionSeo);
    setSlug(blogCategory.slug);
    setH1(blogCategory.h1);

    setSelectedCategory({
      label: blogCategory?.categoryId?.title,
      value: blogCategory?.categoryId?._id,
    });

    setTimeout(() => {
      window.tinymce?.init({
        selector: "#description",
        height: 300,
        menubar: false,
        plugins: "code autolink link ",
        toolbar: "undo redo | code | link | Bold",
      });
    }, 100);

    if (blogCategory.image) {
      setImage([
        {
          preview:
            process.env.REACT_APP_BACKEND_API_URL + "/" + blogCategory.image,
          name: blogCategory.image,
        },
      ]);
    }
    if (blogCategory.imageSeo) {
      setImageSeo([
        {
          preview:
            process.env.REACT_APP_BACKEND_API_URL + "/" + blogCategory.imageSeo,
          name: blogCategory.imageSeo,
        },
      ]);
    }
  }, [blogCategory]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage({});
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("titleSeo", titleSeo);
      formData.append("descriptionSeo", descriptionSeo);
      formData.append("slug", slug);
      formData.append("h1", h1);
      formData.append(
        "description",
        window.tinymce?.get(`description`).getContent()
      );
      if (selectedCategory?.value) {
        formData.append("categoryId", selectedCategory?.value);
      }

      if (image[0] && image[0].type) {
        formData.append("image", image[0]);
      }
      image[0]?.alt && formData.append("imageAlt", image[0].alt);

      if (imageSeo[0] && imageSeo[0].type) {
        formData.append("imageSeo", imageSeo[0]);
      }

      imageSeo[0]?.alt && formData.append("imageSeoAlt", imageSeo[0].alt);

      await axiosInstance.put("/admin/blog-categories/" + _id, formData);
      setLoading(false);
      toast.success("Updated Successfully.");
      navigate("/blog-categories");
    } catch (error) {
      console.log(error);
      if (error.response?.data?.error) {
        setErrorMessage(error.response?.data?.error);
      }
      setLoading(false);
    }
  };

  const categories = async () => {
    setFethcCategoryLoading(true);
    const { data } = await axiosInstance.get(
      "/admin/category-level-one-and-two"
    );
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

  useEffect(() => {
    categories();

    const script = document.createElement("script");
    script.src = "/tinymce/tinymce.min.js";
    document.body.appendChild(script);
  }, []);

  return (
    <React.Fragment>
      <Grid container justifyContent="center">
        <Grid item xs={12}>
          <div className="card mb-12rem  ">
            {fetchBlogCategoryloading ? (
              <div className="d-flex justify-content-center">
                <CircularProgress className="me-3" color="inherit" />
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <div>
                      <label className="form-label" htmlFor="title">
                        Name
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
                  <Grid item xs={12} md={12}>
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

                  <Grid item xs={12} md={12}>
                    <div>
                      <label className="form-label" htmlFor="description">
                        Description
                      </label>
                      <textarea
                        className={`form-input ${
                          Array.isArray(errorMessage?.description)
                            ? "is-invalid"
                            : ""
                        }`}
                        defaultValue={description}
                        id="description"
                      />
                      <div className="text-danger">
                        {Array.isArray(errorMessage?.description) &&
                          errorMessage?.description.map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
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

export default BlogCategoryEdit;
